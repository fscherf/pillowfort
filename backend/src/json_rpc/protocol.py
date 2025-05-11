from enum import Enum, auto
import json


class MESSAGE_TYPE(Enum):
    REQUEST = auto()
    NOTIFICATION = auto()
    RESPONSE = auto()
    ERROR = auto()


class ERROR_TYPE(Enum):
    PARSE_ERROR = -32700
    INVALID_REQUEST = -32600
    METHOD_NOT_FOUND = -32601
    INVALID_PARAMS = -32602
    INTERNAL_ERROR = -32603


class JsonRpcError(Exception):
    ERROR_TYPE = ERROR_TYPE.INTERNAL_ERROR
    ERROR_MESSAGE = 'Internal error'

    def get_error_message(self):
        if self.args:
            return self.args[0]

        return self.ERROR_MESSAGE


class InvalidRequestError(JsonRpcError):
    ERROR_TYPE = ERROR_TYPE.INVALID_REQUEST
    ERROR_MESSAGE = 'Invalid request'


class InvalidParamsError(JsonRpcError):
    ERROR_TYPE = ERROR_TYPE.INVALID_PARAMS
    ERROR_MESSAGE = 'Invalid params'


def decode_message(message_string):
    '''
    returns (error_type, error_message, message_type, message)
    '''

    try:
        message = json.loads(message_string)

    except json.JSONDecodeError:

        # raw message is no valid JSON
        return ERROR_TYPE.PARSE_ERROR, 'Parse error', None, None

    # every JSON RPC message has to contain {"jsonrpc": "2.0"}
    if 'jsonrpc' not in message or message['jsonrpc'] != '2.0':
        return (
            ERROR_TYPE.INVALID_REQUEST,
            "Missing required 'jsonrpc' field.",
            None,
            None,
        )

    message_type = None

    # request / notification
    if 'method' in message:

        # methods have to be strings
        if not isinstance(message['method'], str):
            return (
                ERROR_TYPE.INVALID_REQUEST,
                'Method has to be a string.',
                None,
                None,
            )

        # request
        if 'id' in message:

            # ids have to be a string, number
            if not isinstance(message['id'], (str, int, float)):
                return (
                    ERROR_TYPE.PARSE_ERROR,
                    'Invalid id field: must be a string, number, or null.',
                    None,
                    None,
                )

            message_type = MESSAGE_TYPE.REQUEST

        # notification
        else:
            message_type = MESSAGE_TYPE.NOTIFICATION

    # response
    elif 'result' in message:

        # every result must have an id
        if 'id' not in message:
            return (
                ERROR_TYPE.PARSE_ERROR,
                'Missing id field.',
                None,
                None,
            )

        # ids have to be a string, number
        if not isinstance(message['id'], (str, int, float)):
            return (
                ERROR_TYPE.PARSE_ERROR,
                'Invalid id field: must be a string, number, or null.',
                None,
                None,
            )

        message_type = MESSAGE_TYPE.RESPONSE

    # error
    elif 'error' in message:
        message_type = MESSAGE_TYPE.ERROR

    # valid message
    return None, "", message_type, message


def encode_notification(method, params=None):
    return json.dumps({
        'jsonrpc': '2.0',
        'method': method,
        'params': params,
    })


def encode_result(message_id, result):
    return json.dumps({
        'jsonrpc': '2.0',
        'id': message_id,
        'result': result,
    })


def encode_error(error_type, error_message, message_id=None, data=None):
    message = {
        'jsonrpc': '2.0',
        'error': {
            'code': error_type.value,
            'message': error_message,
        },
    }

    if message_id is not None:
        message['id'] = message_id

    if data:
        message['error']['data'] = data

    return json.dumps(message)
