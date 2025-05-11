def test(request):
    if request.kwargs and 'action' in request.kwargs:
        action = request.kwargs['action']

        # crash
        if action == 'crash':
            raise RuntimeError()

        # notify
        elif action == 'notify':
            method = request.kwargs.get('method', 'test')
            params = request.kwargs.get('params', {})

            request.server.notify(
                method=method,
                params=params,
            )

    return {
        'args': request.args,
        'kwargs': request.kwargs,
    }
