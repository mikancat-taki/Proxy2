FROM python:3.11-slim
WORKDIR /app
COPY cache.py ./
RUN pip install flask cachetools
EXPOSE 5050
CMD ["python", "cache.py"]
