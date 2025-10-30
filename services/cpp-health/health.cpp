#define CPPHTTPLIB_OPENSSL_SUPPORT
#include "httplib.h"
#include <iostream>


int main() {
using namespace httplib;
Server svr;
svr.Get("/health", [](const Request&, Response& res){ res.set_content("ok", "text/plain"); });
svr.Get("/log", [](const Request& req, Response& res){
auto m = req.get_param_value("m");
std::cout << "LOG: " << m << std::endl;
res.set_content("logged", "text/plain");
});
svr.listen("0.0.0.0", 8082);
}
