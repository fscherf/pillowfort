import logging

logger = logging.getLogger('json-rpc.notifications.test')


def test(request):
    logger.info('params: %s', request.params)
