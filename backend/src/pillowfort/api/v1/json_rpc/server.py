from threading import RLock

from json_rpc import JsonRpcServer

from .notification_callbacks import test as test_notification_callbacks
from .methods import subscriptions, methods, auth, test as test_methods

_state = {
    'lock': RLock(),
    'json_rpc_server': None,
}


def gen_json_rpc_server():
    json_rpc_server = JsonRpcServer(
        max_workers=4,
    )

    # testing
    json_rpc_server.add_notification_callbacks([
        ('test', test_notification_callbacks.test),
    ])

    json_rpc_server.add_methods([
        ('test', test_methods.test),
    ])

    # JSON RPC helper
    json_rpc_server.add_methods([
        ('get_methods', methods.get_methods),
        ('whoami', auth.whoami),
        ('subscribe', subscriptions.subscribe),
        ('unsubscribe', subscriptions.unsubscribe),
        ('get_subscriptions', subscriptions.get_subscriptions),
    ])

    return json_rpc_server


def get_json_rpc_server():
    with _state['lock']:
        if not _state['json_rpc_server']:
            _state['json_rpc_server'] = gen_json_rpc_server()

        return _state['json_rpc_server']
