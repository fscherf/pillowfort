def subscribe(request):
    request.client.subscribe(request.args)

    return True


def unsubscribe(request):
    request.client.unsubscribe(request.args)

    return True


def get_subscriptions(request):
    return list(request.client.subscriptions)
