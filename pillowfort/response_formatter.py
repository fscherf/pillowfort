from xml.dom import minidom
import logging
import pprint
import json

json_response_formatter_logger = logging.getLogger(
    'pillowfort.JsonResponseFormatter',
)

xml_response_formatter_logger = logging.getLogger(
    'pillowfort.XMLResponseFormatter',
)


class ResponseFormatter:
    def format_response(self, raw_response):
        return raw_response


class JsonResponseFormatter(ResponseFormatter):
    def format_response(self, raw_response):
        try:
            response = json.loads(raw_response)

            return pprint.pformat(response)

        except Exception:
            json_response_formatter_logger.exception(
                'Exception raised while formatting JSON response',
            )

        return raw_response