from json_rpc import InvalidParamsError


def load_map(request):
    from pillowfort.models import Space

    if len(request.args) != 1 or not isinstance(request.args[0], str):
        raise InvalidParamsError()

    response = {
        'accessGranted': False,
        'mapData': {},
    }

    # check if requesting user has an account
    if not request.client.account:
        return response

    # find space
    space = Space.objects.get_by_url(url=request.args[0])

    if not space:
        return response

    # check if requesting user has access
    access = space.get_access(
        account=request.client.account,
    )

    if not access.has_access:
        return response

    # load map data
    response['accessGranted'] = True
    response['mapData'] = space.get_map_data()

    return response
