from lona.html import (
    CLICK,
    HTML,
    Table,
    THead,
    TBody,
    H1,
    Tr,
    Th,
    Td,
    Br,
)

from lona import LonaView

from lona_bootstrap_5 import (
    TEMPLATE_DIR,
    PrimaryButton,
    MenuItem,
    show_alert,
    TextInput,
    NumberInput,
)

from flamingo import Q, F
from pillowfort.widgets import Contstant


class DataListView(LonaView):
    def handle_tr_click(self, input_event):
        return {
            'redirect': self.server.reverse(
                route_name='pillowfort__data_edit',
                model_name=self.request.match_info['model_name'],
                id=input_event.node._model_id,
            ),
        }

    def handle_search_click(self, input_event):
        if not self.query.value:
            self.render_content_set(self.model)

            return

        try:
            variables = {
                'Q': Q,
                'F': F,
            }

            q = eval(
                self.query.value,
                variables,
                variables,
            )

        except Exception as e:
            show_alert(
                lona_view=self,
                text=str(e),
                type='danger',
            )

            return

        if not isinstance(q, Q):
            show_alert(
                lona_view=self,
                text='Invalid search parameters',
                type='danger',
            )

            return

        self.render_content_set(self.model.filter(q))

    def render_content_set(self, content_set):
        self.thead.clear()
        self.tbody.clear()

        # find columns
        _data = {}

        for content in content_set:
            _data.update(content.data)

        column_names = sorted(list(_data.keys()))

        if 'id' in column_names:
            column_names.remove('id')
            column_names.insert(0, 'id')

        # render thead
        tr = Tr()

        for column_name in column_names:
            tr.append(
                Th(column_name),
            )

        self.thead.append(tr)

        # render tbody
        for content in content_set:
            tr = Tr(
                _style={
                    'cursor': 'pointer',
                },
                events=[CLICK],
                handle_click=self.handle_tr_click,
            )

            tr._model_id = content['id']

            for column_name in column_names:
                value = content[column_name]

                # null
                if value is None:
                    value = Contstant('null')

                # dicts and lists
                elif isinstance(value, (dict, list)):
                    value = Contstant(f'[{type(value).__name__}]')

                else:
                    value = repr(value)

                tr.append(
                    Td(value)
                )

            self.tbody.append(tr)

    def handle_request(self, request):
        model_name = request.match_info['model_name']
        self.model = self.server.state['models'].get_model(model_name)

        self.thead = THead()
        self.tbody = TBody()

        self.query = TextInput(
            placeholder='Query',
            style={
                'display': 'inline',
                'width': '30em',
            },
        )

        self.render_content_set(self.model)

        return HTML(
            H1(f'Data: {model_name}'),
            self.query,
            PrimaryButton('Search', handle_click=self.handle_search_click),
            Br(),
            Br(),
            Table(
                self.thead,
                self.tbody,
                _class='table table-striped table-hover',
                _style='width: 100%',
            ),
        )
