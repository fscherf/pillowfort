def whoami(request):
    return request.client.user.username
