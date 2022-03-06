try:
    from pillowfort.endpoint import Endpoint
    from pillowfort.variable import Variable

except ImportError:
    pass

VERSION = (0, 0)
VERSION_STRING = '.'.join(str(i) for i in VERSION)
