FROM openjdk:17
WORKDIR /app
COPY RateLimiter.java ./
RUN javac RateLimiter.java
EXPOSE 6060
CMD ["java", "RateLimiter"]
