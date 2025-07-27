from pillowfort.models import Account


class AccountMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.account = None

        if hasattr(request, 'user') and request.user.is_authenticated:
            try:
                request.account = Account.objects.get(user=request.user)

            except Account.DoesNotExist:
                pass

        return self.get_response(request)
