import streamlit as st
import boto3
from dotenv import load_dotenv
import os

load_dotenv()
bucket_name = os.getenv('AWS_BUCKET_NAME')
region = os.getenv('AWS_REGION')
s3 = boto3.client('s3', region_name=region)

st.set_page_config(page_title="S3 Agent Dashboard", layout="wide")

st.title("📊 S3 Agent Knowledge Base Dashboard")
st.markdown("---")

# Sidebar for navigation
with st.sidebar:
    st.header("Navigation")
    page = st.radio("Select Page", ["📁 File Browser", "📤 Upload Files", "📊 Statistics"])

# Page 1: File Browser
if page == "📁 File Browser":
    st.header("File Browser")
    
    col1, col2 = st.columns(2)
    with col1:
        if st.button("🔄 Refresh Files", key="refresh_btn"):
            st.rerun()
    
    with col2:
        filter_type = st.selectbox(
            "Filter by type:",
            ["All", "Markdown", "PDF", "JSON", "CSV", "Text", "DOCX", "Logs"]
        )
    
    st.markdown("---")
    
    try:
        response = s3.list_objects_v2(Bucket=bucket_name, Prefix='knowledge-base/')
        
        if 'Contents' in response:
            files = response['Contents']
            
            # Filter files
            if filter_type != "All":
                type_map = {
                    "Markdown": ".md",
                    "PDF": ".pdf",
                    "JSON": ".json",
                    "CSV": ".csv",
                    "Text": ".txt",
                    "DOCX": ".docx",
                    "Logs": ".log"
                }
                ext = type_map.get(filter_type, "")
                files = [f for f in files if f['Key'].endswith(ext)]
            
            st.info(f"📊 Total files: {len(files)}")
            
            # Display files in a table
            for obj in files:
                key = obj['Key']
                size = obj['Size']
                modified = obj['LastModified'].strftime("%Y-%m-%d %H:%M:%S")
                
                col1, col2, col3 = st.columns([3, 1, 1])
                with col1:
                    st.write(f"📄 `{key}`")
                with col2:
                    st.caption(f"{size:,} bytes")
                with col3:
                    st.caption(modified)
        else:
            st.warning("No files found in knowledge base.")
    except Exception as e:
        st.error(f"Error listing files: {str(e)}")

# Page 2: Upload Files
elif page == "📤 Upload Files":
    st.header("Upload New Files")
    st.markdown("Upload files to the knowledge base. They will be automatically organized by type.")
    
    st.markdown("---")
    
    uploaded_files = st.file_uploader(
        "Choose files to upload",
        accept_multiple_files=True,
        type=["md", "pdf", "json", "jsonl", "csv", "txt", "docx", "log"]
    )
    
    if uploaded_files:
        st.info(f"Selected {len(uploaded_files)} file(s)")
        
        if st.button("🚀 Upload Files"):
            progress_bar = st.progress(0)
            status_text = st.empty()
            
            for idx, uploaded_file in enumerate(uploaded_files):
                try:
                    file_ext = os.path.splitext(uploaded_file.name)[1].lower()
                    
                    # Determine folder based on file type
                    type_map = {
                        '.md': 'docs/md-files',
                        '.pdf': 'docs/pdf-files',
                        '.json': 'data/json-files',
                        '.jsonl': 'data/jsonl-files',
                        '.csv': 'data/csv-files',
                        '.txt': 'docs/txt-files',
                        '.docx': 'docs/docx-files',
                        '.log': 'logs/log-files'
                    }
                    
                    folder_prefix = type_map.get(file_ext, 'unknown/unknown')
                    s3_key = f"knowledge-base/{folder_prefix}/{uploaded_file.name}"
                    
                    # Upload file
                    s3.upload_fileobj(uploaded_file, bucket_name, s3_key)
                    
                    status_text.write(f"✅ Uploaded: {uploaded_file.name}")
                    progress_bar.progress((idx + 1) / len(uploaded_files))
                    
                except Exception as e:
                    st.error(f"❌ Error uploading {uploaded_file.name}: {str(e)}")
            
            st.success("✨ All files uploaded successfully!")

# Page 3: Statistics
elif page == "📊 Statistics":
    st.header("Knowledge Base Statistics")
    
    try:
        response = s3.list_objects_v2(Bucket=bucket_name, Prefix='knowledge-base/')
        
        if 'Contents' in response:
            files = response['Contents']
            
            # Calculate statistics
            total_files = len(files)
            total_size = sum(f['Size'] for f in files)
            
            # Group by type
            type_stats = {}
            for obj in files:
                key = obj['Key']
                ext = os.path.splitext(key)[1].lower()
                if ext not in type_stats:
                    type_stats[ext] = {'count': 0, 'size': 0}
                type_stats[ext]['count'] += 1
                type_stats[ext]['size'] += obj['Size']
            
            # Display metrics
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Total Files", total_files)
            with col2:
                st.metric("Total Size", f"{total_size / (1024*1024):.2f} MB")
            with col3:
                st.metric("File Types", len(type_stats))
            
            st.markdown("---")
            st.subheader("Breakdown by File Type")
            
            # Create a table of statistics
            stats_data = []
            for ext, stats in sorted(type_stats.items()):
                stats_data.append({
                    "File Type": ext if ext else "No Extension",
                    "Count": stats['count'],
                    "Size (MB)": f"{stats['size'] / (1024*1024):.2f}"
                })
            
            if stats_data:
                import pandas as pd
                df = pd.DataFrame(stats_data)
                st.dataframe(df, use_container_width=True)
            
            # Pie chart
            st.markdown("---")
            st.subheader("File Distribution")
            
            import pandas as pd
            chart_data = pd.DataFrame([
                {"Type": ext if ext else "Other", "Count": stats['count']}
                for ext, stats in type_stats.items()
            ])
            st.pie_chart(chart_data.set_index("Type")["Count"])
        else:
            st.warning("No files found in knowledge base.")
    except Exception as e:
        st.error(f"Error fetching statistics: {str(e)}")

st.markdown("---")
st.caption("🔐 Powered by AWS S3 | Dashboard built with Streamlit")
