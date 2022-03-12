from pprint import pformat
import traceback
import logging

from lona import LonaView

from lona.html import (
    Pre as BasePre,
    Table,
    HTML,
    H1,
    H2,
    Tr,
    Th,
    Td,
    P,
)

formatter_logger = logging.getLogger('pillowfort.ResponseFormatter')


class Pre(BasePre):
    STYLE = {
        'background-color': '#e9ecef',
    }


class ActivitiesShowView(LonaView):
    def get_activity(self, activity_id):
        with self.server.state.lock:
            for activity in self.server.state['activities']:
                if activity['id'] == activity_id:
                    return activity

    def handle_request(self, request):
        activity_id = request.match_info['id']
        activity = self.get_activity(activity_id)

        if not activity:
            return HTML(
                H1('Error'),
                P('Unknown id'),
            )

        # format response body
        try:
            formatter_class = activity['endpoint'].RESPONSE_FORMATTER
            formatter = formatter_class()

            response_body = formatter.format_response(
                activity['response']['text'],
            )

        except Exception:
            formatter_logger.exception(
                'Exception raised while running %s.format_response',
                formatter,
            )

            response_body = activity['response']['text']

        # render HTML
        html = HTML(
            H1('Activity'),
            Table(
                Tr(
                    Tr(
                        Th('Timestamp'),
                        Td(activity['timestamp']),
                    ),
                    Tr(
                        Th('Method'),
                        Td(activity['method']),
                    ),
                    Tr(
                        Th('URL'),
                        Td(activity['url']),
                    ),
                ),
                _class='table',
            ),

            H2('GET Variables'),
            Pre(
                pformat(activity['get'])
            ),

            H2('POST Variables'),
            Pre(
                pformat(activity['post'])
            ),

            H2('Response'),
            Pre(response_body),
        )

        if activity['error']:
            html.extend([
                H2('Error'),
                Pre(
                    ''.join(
                        traceback.format_exception(
                            type(activity['error']),
                            activity['error'],
                            activity['error'].__traceback__,
                        ),
                    ),
                ),
            ])

        return html