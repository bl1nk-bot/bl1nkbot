import boto3
import os
from dotenv import load_dotenv
from botocore.exceptions import ClientError

load_dotenv()  # Load .env
bucket_name = os.getenv('AWS_BUCKET_NAME')
region = os.getenv('AWS_REGION')
s3_client = boto3.client('s3', region_name=region)

def get_file_type(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    file_types = {
        '.md': ('docs/md-files', 'text/markdown'),
        '.pdf': ('docs/pdf-files', 'application/pdf'),
        '.json': ('data/json-files', 'application/json'),
        '.jsonl': ('data/jsonl-files', 'application/jsonl'),
        '.csv': ('data/csv-files', 'text/csv'),
        '.txt': ('docs/txt-files', 'text/plain'),
        '.docx': ('docs/docx-files', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
        '.log': ('logs/log-files', 'text/plain'),
    }
    return file_types.get(ext, ('unknown/unknown', 'application/octet-stream'))

def upload_and_verify(file_name):
    local_path = file_name  # ใน GitHub, assume files ใน root
    folder_prefix, content_type = get_file_type(file_name)
    s3_key = f"knowledge-base/{folder_prefix}/{file_name}"
    metadata = {'file-type': folder_prefix.split('/')[1]}

    try:
        s3_client.upload_file(
            local_path, bucket_name, s3_key,
            ExtraArgs={'Metadata': metadata, 'ContentType': content_type}
        )
        print(f"Uploaded {file_name} to knowledge-base/{folder_prefix}/")

        # Verify: List objects ใน prefix นั้น
        response = s3_client.list_objects_v2(Bucket=bucket_name, Prefix=f"knowledge-base/{folder_prefix}/")
        if 'Contents' in response:
            print(f"Verified: {len(response['Contents'])} files in {folder_prefix}")
        else:
            print(f"No files in {folder_prefix} - check upload")
    except ClientError as e:
        print(f"Error {file_name}: {e}")

if __name__ == "__main__":
    test_files = ['test.md', 'test.pdf', 'test.json', 'test.jsonl', 'test.csv', 'test.txt', 'test.docx']
    for f in test_files:
        if os.path.exists(f):
            upload_and_verify(f)
        else:
            print(f"File {f} not found, skipping...")
