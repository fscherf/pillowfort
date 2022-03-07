import yaml

from lona import LonaView

from lona.html import (
    CheckBox,
    HTML,
    Table,
    Br,
    Tr,
    Td,
    Th,
    H1,
    P,
)

from pillowfort.widgets import Contstant

from flamingo.core.data_model import ObjectDoesNotExist

from lona_bootstrap_5 import (
    SuccessButton,
    DangerButton,
    TextInput,
    NumberInput,
    TextArea,
)


class DataEditView(LonaView):
    def handle_save(self, input_event):
        for html_input in self.html_inputs:
            name = html_input.attributes['name']
            value = html_input.value

            if isinstance(html_input, TextArea):
                try:
                    value = yaml.safe_load(value)

                except yaml.parser.ParserError:
                    self.show_alert(
                        text=f'{name} contains invalid YAML',
                        type='danger',
                    )

            if name == 'id':
                value = int(value)

            self.model_object[name] = value

        return {
            'redirect': self.server.reverse(
                route_name='pillowfort__data_list',
                model_name=self.model_name,
            )
        }

    def handle_cancel(self, input_event):
        return {
            'redirect': self.server.reverse(
                route_name='pillowfort__data_list',
                model_name=self.model_name,
            )
        }

    def generate_html_input(self, key, value):
        if type(value) in (int, float):
            return NumberInput(
                value=value,
                name=key,
            )

        elif type(value) == str:
            return TextInput(
                value=value,
                name=key,
            )

        elif type(value) == bool:
            return CheckBox(
                value=value,
                name=key,
            )

        value = yaml.dump(value)

        return TextArea(
            value=value,
            name=key,
        )

    def handle_request(self, request):
        self.model_name = request.match_info['model_name']
        self.model = self.server.state['models'].get_model(self.model_name)

        try:
            self.model_id = int(request.match_info['id'])

        except ValueError:
            return HTML(
                H1('Error'),
                P('Invalid id ', Contstant(request.match_info['id'])),
            )

        try:
            self.model_object = self.model.get(id=self.model_id)

        except ObjectDoesNotExist:
            return HTML(
                H1('Error'),
                P(
                    'Model object with id: ',
                    Contstant(self.model_id),
                    ' does not exist',
                ),
            )

        # edit
        self.html_inputs = []
        table = Table()

        self.html = HTML(
            H1(f'Edit {self.model_name}(id={self.model_id})'),
            table,
            Br(),
            SuccessButton('Save', handle_click=self.handle_save),
            ' ',
            DangerButton('Cancel', handle_click=self.handle_cancel),
        )

        for key, value in sorted(self.model_object.data.items()):
            html_input = self.generate_html_input(key, value)

            table.append(
                Tr(
                    Th(f'{key }'),
                    Td(html_input),
                ),
            )

            self.html_inputs.append(html_input)

        return self.html