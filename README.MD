# 🧠 OpenAI Cv Evaluator (Node.js)
Automated CV and Project Evaluation Service powered by LLMs and PDF parsing.  
This backend system automatically evaluates a candidate's **CV** and **Project Report** using **OpenAI**, providing structured feedback and scoring for job matching.

---

## 🚀 Features
* Upload and store candidate CV and Project report securely.
* Single job ID per upload for consistent evaluation.
* PDF parsing using `pdf-parse` for text extraction.
* Designed for integration with **OpenAI**.
* Async evaluation pipeline (to be integrated with job queue).
* Organized file structure per submission in `/uploads/{id}`.

---

## 🧬 Tech Stack

| Layer                      | Technology                        |
| --------------------------- | --------------------------------- |
| **Backend Framework**       | Express.js                        |
| **File Upload Handling**    | Multer                            |
| **Document Parsing**        | pdf-parse                         |
| **Unique ID Generation**    | uuid                              |
| **Filesystem Handling**     | Node.js `fs` & `path` modules     |
| **Environment Management**  | dotenv                            |
| **AI Integration (future)** | OpenAI (`OpenAI`) |

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/haloalfii/cv-evaluator.git
cd cv-evaluator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File
Make a `.env` file (or copy from `.env.example`) and add your OpenAI Key, ChromaDB Url and App PORT:


```env
PORT=
CHROMA_DB_URL=

OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```
### 5. Run ChromaDB and Ingest Data

```bash
npm run ingest:all
```

### 6. Run the Server

```bash
npm run start
```

### 7. Run the Worker

```bash
npm run worker
```

## API Endpoints

### `POST /upload`

Upload candidate CV and project report files (PDFs).

**Body (form-data):**

| Field   | Type | Description              |
| ------- | ---- | ------------------------ |
| cv      | file | Candidate CV             |
| project | file | Candidate Project Report |

**Response Example:**

```json
{
    "message": "Files uploaded successfully",
    "id": "a76e03bd-cef6-4ad8-94ca-0584d6d261fb",
    "files": {
        "cv": {
            "id": "cv-17687c73-92b3-4f5f-b8c6-746d77364351",
            "filename": "cv-17687c73-92b3-4f5f-b8c6-746d77364351-Resume Alfian Luthfi.pdf",
            "path": "src/uploads/cv/cv-17687c73-92b3-4f5f-b8c6-746d77364351-Resume Alfian Luthfi.pdf"
        },
        "project": {
            "id": "project-eeb4d176-7ac9-4252-aba5-0e4c201c657b",
            "filename": "project-eeb4d176-7ac9-4252-aba5-0e4c201c657b-Resume Alfian Luthfi.pdf",
            "path": "src/uploads/project/project-eeb4d176-7ac9-4252-aba5-0e4c201c657b-Project Alfian Luthfi.pdf"
        }
    }
}
```

---

### 📟 `POST /evaluate`

Trigger automated evaluation using uploaded file IDs.

**Body (form-data):**

| Field      | Type | Description            |
| ---------- | ---- | ---------------------- |
| title      | text | Job title to evaluate  |
| cv_id      | text | ID of uploaded CV      |
| project_id | text | ID of uploaded project |

**Response Example:**

```json
{
    "id": "9",
    "status": "queued"
}
```

---

### 📊 `GET /result/{job_id}`

Retrieve the final evaluation result.

**Response Example:**

```json
{
  "id": "9",
  "status": "completed",
  "result": {
    "cv_match_rate": 0.82,
    "cv_feedback": "Strong in backend and cloud, limited AI integration experience...",
    "project_score": 4.5,
    "project_feedback": "Meets prompt chaining requirements, lacks error handling robustness...",
    "overall_summary": "Good candidate fit, would benefit from deeper RAG knowledge..."
  }
}
```

---