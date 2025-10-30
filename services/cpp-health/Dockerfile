FROM gcc:12
WORKDIR /app
COPY health.cpp ./
# download single-header httplib
RUN apt-get update && apt-get install -y wget
RUN wget -q -O httplib.h https://raw.githubusercontent.com/yhirose/cpp-httplib/master/httplib.h
RUN g++ -std=c++17 health.cpp -o health
EXPOSE 8082
CMD ["./health"]
