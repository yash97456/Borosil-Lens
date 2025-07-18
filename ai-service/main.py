
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import os
import json
import uuid
import numpy as np
import pandas as pd
from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel
from datetime import datetime
import io
from google.cloud import bigquery
from google.cloud.exceptions import NotFound
import base64
import logging
from dataclasses import dataclass
import uvicorn
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets
from typing import Tuple
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Config:
    IMG_SIZE = (224, 224)
    MAX_FILE_SIZE = 10 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
    MIN_SIZE = (100, 100)
    MAX_SIZE = (4000, 4000)
    SIMILARITY_THRESHOLD = 0.75
    CLIP_MODEL_NAME = "openai/clip-vit-base-patch32"
    TOP_K_RESULTS = 3
    PROJECT_ID = "borosil-it"
    DATASET_ID = "borosil_lens"
    TABLE_ID = "sku_images"
    MASTER_TABLE_ID = "master_table"
    FEEDBACK_TABLE_ID = "user_feedback"
    TRAINING_TABLE_ID = "feedback_training"
    FULL_TABLE_ID = f"{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}"
    FULL_MASTER_TABLE_ID = f"{PROJECT_ID}.{DATASET_ID}.{MASTER_TABLE_ID}"
    FULL_FEEDBACK_TABLE_ID = f"{PROJECT_ID}.{DATASET_ID}.{FEEDBACK_TABLE_ID}"
    FULL_TRAINING_TABLE_ID = f"{PROJECT_ID}.{DATASET_ID}.{TRAINING_TABLE_ID}"
    SERVICE_ACCOUNT_PATH = "borosil-lens.json" 

config = Config()
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = config.SERVICE_ACCOUNT_PATH

class BaseResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

class UploadResponse(BaseResponse):
    pass

class SearchResponse(BaseResponse):
    pass

class FeedbackRequest(BaseModel):
    username: str
    predicted_sku: str
    correct_sku: str

class FeedbackResponse(BaseResponse):
    pass

class ApprovalRequest(BaseModel):
    feedback_id: str
    admin_name: str

class StatsResponse(BaseResponse):
    pass

class CLIPFeatureExtractor:
    """Extract features from images using CLIP model"""

    def __init__(self):
        self.model = None
        self.processor = None
        self.device = None
        self.load_model()

    def load_model(self):
        try:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            self.model = CLIPModel.from_pretrained(config.CLIP_MODEL_NAME)
            self.processor = CLIPProcessor.from_pretrained(config.CLIP_MODEL_NAME)
            self.model = self.model.to(self.device)
            self.model.eval()
            logger.info(f"CLIP model loaded successfully on {self.device}")
        except Exception as e:
            logger.error(f"CLIP model loading failed: {e}")
            raise

    def extract_features_from_bytes(self, image_bytes: bytes) -> Optional[np.ndarray]:
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            inputs = self.processor(images=image, return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            with torch.no_grad():
                image_features = self.model.get_image_features(**inputs)
                image_features = image_features / image_features.norm(dim=-1, keepdim=True)

            return image_features.cpu().numpy().flatten()
        except Exception as e:
            logger.error(f"CLIP feature extraction failed: {e}")
            return None

class ImageValidator:
    """Validate uploaded images"""

    @staticmethod
    def validate_image_bytes(image_bytes: bytes) -> Tuple[bool, str]:
        try:
            if len(image_bytes) > config.MAX_FILE_SIZE:
                return False, f"File too large. Max: {config.MAX_FILE_SIZE//1024//1024}MB"

            with Image.open(io.BytesIO(image_bytes)) as img:
                width, height = img.size
                if width < config.MIN_SIZE[0] or height < config.MIN_SIZE[1]:
                    return False, f"Image too small. Min: {config.MIN_SIZE}"
                if width > config.MAX_SIZE[0] or height > config.MAX_SIZE[1]:
                    return False, f"Image too large. Max: {config.MAX_SIZE}"

            return True, "Valid image"
        except Exception as e:
            return False, f"Validation error: {e}"

class BigQueryDatasetManager:
    """Manage BigQuery database operations"""

    def __init__(self):
        self.client = None
        self.init_client()

    def init_client(self):
        try:
            self.client = bigquery.Client(project=config.PROJECT_ID)
            query = "SELECT 1 as test"
            test_job = self.client.query(query)
            list(test_job.result())
            logger.info("BigQuery client initialized successfully")
        except Exception as e:
            logger.error(f"BigQuery client initialization failed: {e}")
            self.client = None

    def validate_sku_code(self, sku_code: str) -> Tuple[bool, Optional[str]]:
        """Validate SKU code against master table"""
        if not self.client:
            return False, None

        try:
            query = f"""
            SELECT description
            FROM `{config.FULL_MASTER_TABLE_ID}`
            WHERE sku_code = @sku_code
            LIMIT 1
            """

            job_config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("sku_code", "STRING", sku_code.strip())
                ]
            )

            result = list(self.client.query(query, job_config=job_config).result())

            if result:
                return True, result[0].description
            else:
                return False, None

        except Exception as e:
            logger.error(f"SKU validation failed: {e}")
            return False, None

    def get_sku_list(self) -> Dict[str, Any]:
        """Get list of all SKUs from master table"""
        if not self.client:
            logger.error("BigQuery client not available")
            return {
                "success": False,
                "message": "Database connection not available",
                "data": None
            }

        try:
            query = f"""
            SELECT sku_code, description
            FROM `{config.FULL_MASTER_TABLE_ID}`
            ORDER BY sku_code
            """

            query_job = self.client.query(query)
            results = []

            for row in query_job.result():
                results.append({
                    "sku_code": row.sku_code,
                    "description": row.description
                })

            logger.info(f"Retrieved {len(results)} SKUs from master table")
            return {
                "success": True,
                "message": f"Retrieved {len(results)} SKUs successfully",
                "data": {
                    "skus": results,
                    "total_count": len(results)
                }
            }

        except Exception as e:
            logger.error(f"Get SKU list failed: {e}")
            return {
                "success": False,
                "message": f"Failed to retrieve SKU list: {str(e)}",
                "data": None
            }

    def save_record(self, record_data: Dict[str, Any], username: str) -> bool:
        if not self.client:
            logger.error("BigQuery client not available")
            return False

        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{record_data['sku_code']}_{timestamp}.jpg"

            with Image.open(io.BytesIO(record_data['image_bytes'])) as img:
                width, height = img.size

            image_b64 = base64.b64encode(record_data['image_bytes']).decode('utf-8')
            features_list = record_data['features'].tolist()

            insert_query = f"""
            INSERT INTO `{config.FULL_TABLE_ID}`
            (id, sku_code, image_name, image_data, file_size, width, height, processed_at, clip_features, uploaded_by)
            VALUES
            (@id, @sku_code, @image_name, @image_data, @file_size, @width, @height, @processed_at, @clip_features, @uploaded_by)
            """

            job_config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("id", "STRING", record_data['id']),
                    bigquery.ScalarQueryParameter("sku_code", "STRING", record_data['sku_code']),
                    bigquery.ScalarQueryParameter("image_name", "STRING", filename),
                    bigquery.ScalarQueryParameter("image_data", "STRING", image_b64),
                    bigquery.ScalarQueryParameter("file_size", "INTEGER", len(record_data['image_bytes'])),
                    bigquery.ScalarQueryParameter("width", "INTEGER", width),
                    bigquery.ScalarQueryParameter("height", "INTEGER", height),
                    bigquery.ScalarQueryParameter("processed_at", "TIMESTAMP", datetime.now()),
                    bigquery.ArrayQueryParameter("clip_features", "FLOAT64", features_list),
                    bigquery.ScalarQueryParameter("uploaded_by", "STRING", username),
                ]
            )

            query_job = self.client.query(insert_query, job_config=job_config)
            query_job.result()
            logger.info(f"Successfully saved record: {record_data['id']}")
            return True
        except Exception as e:
            logger.error(f"Direct insert failed: {e}")
            return False

    def get_training_corrections(self, query_features: np.ndarray) -> Optional[Dict[str, Any]]:
        if not self.client:
            return None

        try:
            query_sql = f"""
            SELECT correct_sku, image_features
            FROM `{config.FULL_TRAINING_TABLE_ID}`
            ORDER BY created_at DESC
            """

            query_job = self.client.query(query_sql)

            for row in query_job.result():
                db_features = np.array(row.image_features)
                query_features_np = np.array(query_features)

                if np.linalg.norm(query_features_np) == 0 or np.linalg.norm(db_features) == 0:
                    continue

                query_features_norm = query_features_np / np.linalg.norm(query_features_np)
                db_features_norm = db_features / np.linalg.norm(db_features)
                similarity = np.dot(query_features_norm, db_features_norm)

                if similarity >= 0.9:
                    return {
                        'sku_code': row.correct_sku,
                        'similarity_score': float(similarity),
                        'source': 'feedback_training'
                    }

            return None
        except Exception as e:
            logger.error(f"Get training corrections failed: {e}")
            return None

    def search_similar_images(self, query_features: np.ndarray, top_k: Optional[int] = None) -> List[Dict[str, Any]]:
        if not self.client:
            return []

        if top_k is None:
            top_k = config.TOP_K_RESULTS

        try:
            features_list = query_features.tolist()
            training_correction = self.get_training_corrections(query_features)
            if training_correction:
                return [training_correction]

            query_sql = f"""
            SELECT id, sku_code, image_name, image_data, clip_features, file_size, width, height, uploaded_by
            FROM `{config.FULL_TABLE_ID}`
            WHERE clip_features IS NOT NULL
            ORDER BY processed_at DESC
            """

            query_job = self.client.query(query_sql)
            results = query_job.result()
            matches = []
            sku_best_matches = {}  

            for row in results:
                try:
                    if not row.clip_features:
                        continue

                    db_features = np.array(row.clip_features)
                    query_features_np = np.array(features_list)

                    if np.linalg.norm(query_features_np) == 0 or np.linalg.norm(db_features) == 0:
                        continue

                    query_features_norm = query_features_np / np.linalg.norm(query_features_np)
                    db_features_norm = db_features / np.linalg.norm(db_features)
                    similarity = np.dot(query_features_norm, db_features_norm)

                    if similarity >= config.SIMILARITY_THRESHOLD:
                        match_data = {
                            'id': row.id,
                            'sku_code': row.sku_code,
                            'image_name': row.image_name,
                            'similarity_score': float(similarity),
                            'image_data': row.image_data[:100] + "...",
                            'feature_model': config.CLIP_MODEL_NAME,
                            'file_size': row.file_size,
                            'dimensions': f"{row.width}x{row.height}",
                            'uploaded_by': row.uploaded_by,
                            'source': 'database'
                        }

                        if row.sku_code not in sku_best_matches or similarity > sku_best_matches[row.sku_code]['similarity_score']:
                            sku_best_matches[row.sku_code] = match_data

                except Exception as e:
                    logger.error(f"Error processing row: {e}")
                    continue

            matches = list(sku_best_matches.values())
            matches.sort(key=lambda x: x['similarity_score'], reverse=True)
            return matches[:top_k]
        except Exception as e:
            logger.error(f"BigQuery search failed: {e}")
            return []

    def save_feedback(self, username: str, predicted_sku: str, correct_sku: str, image_features: np.ndarray, image_bytes: bytes) -> Tuple[bool, Optional[str]]:
        if not self.client:
            logger.error("BigQuery client not available")
            return False, None

        try:
            feedback_id = str(uuid.uuid4())[:8]
            features_list = image_features.tolist()

            image_b64 = base64.b64encode(image_bytes).decode('utf-8')

            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"feedback_{predicted_sku}_{timestamp}.jpg"

            insert_query = f"""
            INSERT INTO `{config.FULL_FEEDBACK_TABLE_ID}`
            (feedback_id, username, predicted_sku, correct_sku, image_features, image_data, image_name, file_size, complaint_time, status, admin_name, approval_time)
            VALUES
            (@feedback_id, @username, @predicted_sku, @correct_sku, @image_features, @image_data, @image_name, @file_size, @complaint_time, @status, @admin_name, @approval_time)
            """

            job_config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("feedback_id", "STRING", feedback_id),
                    bigquery.ScalarQueryParameter("username", "STRING", username),
                    bigquery.ScalarQueryParameter("predicted_sku", "STRING", predicted_sku),
                    bigquery.ScalarQueryParameter("correct_sku", "STRING", correct_sku),
                    bigquery.ArrayQueryParameter("image_features", "FLOAT64", features_list),
                    bigquery.ScalarQueryParameter("image_data", "STRING", image_b64),
                    bigquery.ScalarQueryParameter("image_name", "STRING", filename),
                    bigquery.ScalarQueryParameter("file_size", "INTEGER", len(image_bytes)),
                    bigquery.ScalarQueryParameter("complaint_time", "TIMESTAMP", datetime.now()),
                    bigquery.ScalarQueryParameter("status", "STRING", 'PENDING'),
                    bigquery.ScalarQueryParameter("admin_name", "STRING", None),
                    bigquery.ScalarQueryParameter("approval_time", "TIMESTAMP", None),
                ]
            )

            query_job = self.client.query(insert_query, job_config=job_config)
            query_job.result()
            logger.info(f"Successfully saved feedback: {feedback_id}")
            return True, feedback_id
        except Exception as e:
            logger.error(f"Feedback insert failed: {e}")
            return False, None

    def get_pending_feedback(self) -> List[Dict[str, Any]]:
        if not self.client:
            logger.error("BigQuery client not available")
            return []

        try:
            query_sql = f"""
            SELECT 
            f.feedback_id,
            u.username,  -- Get the actual username
            f.predicted_sku,
            f.correct_sku,
            f.image_data,
            f.image_name,
            f.file_size,
            f.complaint_time,
            f.status
        FROM `{config.FULL_FEEDBACK_TABLE_ID}` f
        LEFT JOIN `{config.PROJECT_ID}.{config.DATASET_ID}.users` u
        ON f.username = u.id  -- f.username is actually user_id
        WHERE f.status = 'PENDING'
        ORDER BY f.complaint_time DESC
        """

            query_job = self.client.query(query_sql)
            results = []

            for row in query_job.result():
                results.append({
                    'feedback_id': row.feedback_id,
                    'username': row.username,
                    'username': row.username,
                    'predicted_sku': row.predicted_sku,
                    'correct_sku': row.correct_sku,
                    'image_data': row.image_data,
                    'image_name': row.image_name,
                    'file_size': row.file_size,
                    'complaint_time': row.complaint_time.strftime("%Y-%m-%d %H:%M:%S"),
                    'status': row.status
                })

            return results
        except Exception as e:
            logger.error(f"Get pending feedback failed: {e}")
            return []

    def approve_feedback(self, feedback_id: str, admin_name: str) -> bool:
        if not self.client:
            logger.error("BigQuery client not available")
            return False

        try:
            feedback_query = f"""
            SELECT image_features, correct_sku
            FROM `{config.FULL_FEEDBACK_TABLE_ID}`
            WHERE feedback_id = @feedback_id
            """

            job_config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("feedback_id", "STRING", feedback_id),
                ]
            )

            query_job = self.client.query(feedback_query, job_config=job_config)
            feedback_data = list(query_job.result())

            if not feedback_data:
                logger.error(f"Feedback not found: {feedback_id}")
                return False

            row = feedback_data[0]
            image_features = row.image_features
            correct_sku = row.correct_sku
            training_id = str(uuid.uuid4())[:8]

            training_insert = f"""
            INSERT INTO `{config.FULL_TRAINING_TABLE_ID}`
            (training_id, image_features, correct_sku, feedback_id, created_at)
            VALUES
            (@training_id, @image_features, @correct_sku, @feedback_id, @created_at)
            """

            training_job_config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("training_id", "STRING", training_id),
                    bigquery.ArrayQueryParameter("image_features", "FLOAT64", image_features),
                    bigquery.ScalarQueryParameter("correct_sku", "STRING", correct_sku),
                    bigquery.ScalarQueryParameter("feedback_id", "STRING", feedback_id),
                    bigquery.ScalarQueryParameter("created_at", "TIMESTAMP", datetime.now()),
                ]
            )

            training_query_job = self.client.query(training_insert, job_config=training_job_config)
            training_query_job.result()

            update_sql = f"""
            UPDATE `{config.FULL_FEEDBACK_TABLE_ID}`
            SET status = 'APPROVED',
                admin_name = @admin_name,
                approval_time = @approval_time
            WHERE feedback_id = @feedback_id
            """

            update_job_config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("admin_name", "STRING", admin_name),
                    bigquery.ScalarQueryParameter("approval_time", "TIMESTAMP", datetime.now()),
                    bigquery.ScalarQueryParameter("feedback_id", "STRING", feedback_id),
                ]
            )

            update_query_job = self.client.query(update_sql, job_config=update_job_config)
            update_query_job.result()

            logger.info(f"Successfully approved feedback: {feedback_id}")
            return True
        except Exception as e:
            logger.error(f"Approve feedback failed: {e}")
            return False

    def get_dataset_info(self) -> Dict[str, int]:
        if not self.client:
            return {'total_records': 0, 'unique_skus': 0, 'clip_records': 0, 'master_skus': 0}

        try:
            query_sql = f"""
            SELECT
                COUNT(*) as total_records,
                COUNT(DISTINCT sku_code) as unique_skus,
                COUNT(CASE WHEN clip_features IS NOT NULL THEN 1 END) as clip_records
            FROM `{config.FULL_TABLE_ID}`
            """

            query_job = self.client.query(query_sql)
            result = list(query_job.result())[0]
            master_query = f"""
            SELECT COUNT(*) as master_skus
            FROM `{config.FULL_MASTER_TABLE_ID}`
            """

            master_job = self.client.query(master_query)
            master_result = list(master_job.result())[0]

            return {
                'total_records': int(result.total_records),
                'unique_skus': int(result.unique_skus),
                'clip_records': int(result.clip_records),
                'master_skus': int(master_result.master_skus)
            }
        except Exception as e:
            logger.error(f"Get dataset info failed: {e}")
            return {'total_records': 0, 'unique_skus': 0, 'clip_records': 0, 'master_skus': 0}

feature_extractor = CLIPFeatureExtractor()
validator = ImageValidator()
dataset_manager = BigQueryDatasetManager()
backend = dataset_manager  

app = FastAPI(
    title="SKU Processor API",
    description="Image-based SKU processing and similarity search system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload-image", response_model=UploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    sku_code: str = Form(...),
    username: str = Form(...)
):
    """
    Upload an image with SKU code to the database
    """
    try:
        image_bytes = await file.read()

        if not image_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No image data provided"
            )

        if not sku_code or not sku_code.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="SKU code is required"
            )

        if not username or not username.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is required"
            )

        is_valid_sku, description = dataset_manager.validate_sku_code(sku_code.strip())

        if not is_valid_sku:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"SKU code '{sku_code}' not found in master database. Please contact admin to add this SKU."
            )

        is_valid, validation_message = validator.validate_image_bytes(image_bytes)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Image validation failed: {validation_message}"
            )

        features = feature_extractor.extract_features_from_bytes(image_bytes)
        if features is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to extract image features"
            )

        record_data = {
            'id': str(uuid.uuid4()),
            'sku_code': sku_code.strip(),
            'image_bytes': image_bytes,
            'features': features
        }

        success = dataset_manager.save_record(record_data, username)

        if success:
            return UploadResponse(
                success=True,
                message=f"Image uploaded successfully for SKU: {sku_code}",
                data={
                    "id": record_data['id'],
                    "sku_code": sku_code.strip(),
                    "description": description,
                    "feature_dimensions": len(features),
                    "image_size": len(image_bytes)
                }
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save image to database"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload image failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image upload failed: {str(e)}"
        )

@app.post("/search-similar", response_model=SearchResponse)
async def search_similar_images(file: UploadFile = File(...)):
    """
    Search for similar images in the database
    """
    try:
        image_bytes = await file.read()

        if not image_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No image data provided"
            )

        is_valid, validation_message = validator.validate_image_bytes(image_bytes)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Image validation failed: {validation_message}"
            )

        features = feature_extractor.extract_features_from_bytes(image_bytes)
        if features is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to extract image features"
            )

        similar_images = dataset_manager.search_similar_images(features)

        if not similar_images:
            return SearchResponse(
                success=True,
                message="No similar images found in database",
                data={
                    "matches": [],
                    "total_matches": 0,
                    "note": "Try adjusting the similarity threshold or upload more reference images"
                }
            )

        return SearchResponse(
            success=True,
            message=f"Found {len(similar_images)} similar images",
            data={
                "matches": similar_images,
                "total_matches": len(similar_images)
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Search similar images failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search failed: {str(e)}"
        )

@app.post("/submit-feedback", response_model=FeedbackResponse)
async def submit_feedback(
    file: UploadFile = File(...),
    username: str = Form(...),
    predicted_sku: str = Form(...),
    correct_sku: str = Form(...)
):
    """
    Submit feedback for incorrect predictions
    """
    try:
        image_bytes = await file.read()

        if not all([username, predicted_sku, correct_sku, image_bytes]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="All fields are required for feedback submission"
            )

        is_valid_sku, description = dataset_manager.validate_sku_code(correct_sku.strip())

        if not is_valid_sku:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Correct SKU code '{correct_sku}' not found in master database"
            )

        features = feature_extractor.extract_features_from_bytes(image_bytes)
        if features is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to extract image features"
            )

        success, feedback_id = dataset_manager.save_feedback(
            username, predicted_sku, correct_sku, features, image_bytes
        )

        if success:
            return FeedbackResponse(
                success=True,
                message="Feedback submitted successfully",
                data={
                    "feedback_id": feedback_id,
                    "status": "PENDING",
                    "correct_sku": correct_sku,
                    "description": description
                }
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save feedback"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Submit feedback failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Feedback submission failed: {str(e)}"
        )

@app.get("/sku-list", response_model=BaseResponse)
async def get_sku_list():
    """Get list of all SKUs from master table"""
    try:
        result = backend.get_sku_list()

        if result["success"]:
            return BaseResponse(**result)
        else:
            raise HTTPException(
                status_code=500,
                detail=result["message"]
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get SKU list endpoint failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
@app.get("/pending-feedback")
async def get_pending_feedback():
    """
    Get pending feedback for admin review
    """
    try:
        feedback_list = dataset_manager.get_pending_feedback()

        return {
            "success": True,
            "message": f"Retrieved {len(feedback_list)} pending feedback items",
            "data": {
                "feedback_list": feedback_list,
                "total_pending": len(feedback_list)
            }
        }
    except Exception as e:
        logger.error(f"Get pending feedback failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve pending feedback: {str(e)}"
        )

@app.post("/approve-feedback")
async def approve_feedback(request: ApprovalRequest):
    """
    Approve feedback and add to training data
    """
    try:
        if not request.feedback_id or not request.admin_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Feedback ID and admin name are required"
            )

        success = dataset_manager.approve_feedback(request.feedback_id, request.admin_name)

        if success:
            return {
                "success": True,
                "message": "Feedback approved successfully and added to training data",
                "data": {
                    "feedback_id": request.feedback_id,
                    "admin_name": request.admin_name,
                    "status": "APPROVED"
                }
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Feedback not found or already processed: {request.feedback_id}"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Approve feedback failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve feedback: {str(e)}"
        )

@app.get("/dataset-stats", response_model=StatsResponse)
async def get_dataset_stats():
    """
    Get dataset statistics
    """
    try:
        stats = dataset_manager.get_dataset_info()

        return StatsResponse(
            success=True,
            message="Dataset statistics retrieved successfully",
            data={
                "statistics": stats,
                "total_records": stats.get('total_records', 0),
                "unique_skus": stats.get('unique_skus', 0),
                "clip_records": stats.get('clip_records', 0),
                "master_skus": stats.get('master_skus', 0)
            }
        )

    except Exception as e:
        logger.error(f"Get dataset stats failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve dataset statistics: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "success": True,
        "message": "API is running",
        "data": {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "bigquery_status": "connected" if dataset_manager.client else "disconnected",
            "clip_model": config.CLIP_MODEL_NAME
        }
    }

@app.get("/")
async def root():
    """
    Root endpoint with API information
    """
    return {
        "success": True,
        "message": "SKU Processor API",
        "data": {
            "version": "1.0.0",
            "description": "Image-based SKU processing and similarity search system",
            "endpoints": {
                "upload": "/upload-image",
                "search": "/search-similar",
                "feedback": "/submit-feedback",
                "sku_list": "/sku-list",
                "pending_feedback": "/pending-feedback",
                "approve_feedback": "/approve-feedback",
                "stats": "/dataset-stats",
                "health": "/health"
            }
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="localhost",
        port=8000,
        reload=True,
        log_level="info"
    )

