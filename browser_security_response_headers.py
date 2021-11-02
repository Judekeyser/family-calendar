###############################################################################
###############################  BUSINESS UNITS  ##############################

__default_headers = {
    "Content-Security-Policy": "default-src 'none'; connect-src 'self'; font-src https://fonts.gstatic.com;img-src 'none'; object-src 'none'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'",
    "X-Frame-Options": "none",
    "Referrer-Policy": "no-referrer",
    "Feature-Policy": "camera 'none'; fullscreen 'self'; geolocation 'none'; microphone 'none'",
    "X-Permitted-Cross-Domain-Policies": "none",
    "X-XSS-Protection": "1; mode=block",
    "X-Content-Type-Options": "nosniff"
}

__ssl_ctx_headers = {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload"
}

def apply (h_consumer, ssl_ctx):
    global __default_headers, __ssl_ctx_headers
    for key in __default_headers:
        h_consumer(key, __default_headers[key])

    if ssl_ctx:
        for key in __ssl_ctx_headers:
            h_consumer(key, __ssl_ctx_headers[key])


###############################################################################
#####################  MAIN PROCESS PRINTS CONFIGURATIONS  ####################

if __name__ == '__main__':
    h_consumer = lambda k,v: print("%s -> %s" % (k, v))
    apply (h_consumer, True)


