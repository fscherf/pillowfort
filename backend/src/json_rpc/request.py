class JsonRpcRequest:
    def __init__(self, server, client, message):
        self.server = server
        self.client = client
        self.message = message

        # shortcuts
        self.method = self.message.get('method', '')
        self.topic = self.method
        self.params = self.message.get('params', None)

        if isinstance(self.params, list):
            self.args = self.params
            self.kwargs = {}

        elif isinstance(self.params, dict):
            self.args = []
            self.kwargs = self.params

        elif self.params is not None:
            self.args = [self.params]
            self.kwargs = {}

        else:
            self.args = []
            self.kwargs = {}
