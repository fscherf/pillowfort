def get_methods(request):
    return list(request.server.methods.keys())
