try:
    from pillowfort.endpoint import Endpoint
    from pillowfort.variable import Variable
    from pillowfort.response_formatter import *  # NOQA

except ImportError:
    pass

VERSION = (0, 2)
VERSION_STRING = '.'.join(str(i) for i in VERSION)
