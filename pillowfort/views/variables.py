from lona import LonaView

from lona.html import (
    HTML,
    H1,
    H2,
    Table,
    THead,
    TBody,
    Tr,
    Th,
    Td,
)

from lona_bootstrap_5 import (
    NumberInput,
    TextInput,
    Switch,
)


class VariablesView(LonaView):
    def generate_variable_input(self, section, name, value):
        def handle_change(input_event):
            new_value = input_event.node.value

            with self.server.state.lock:
                self.server.state['variables'][section][name] = new_value

            return input_event

        if type(value) == int or type(value) == float:
            variable_input = NumberInput(
                value=value,
                handle_change=handle_change,
            )

        elif type(value) == bool:
            variable_input = Switch(
                value=value,
                handle_change=handle_change,
            )

        else:
            variable_input = TextInput(
                value=value,
                handle_change=handle_change,
            )

        return variable_input

    def handle_request(self, request):
        self.html = HTML(
            H1('Variables'),
        )

        with self.server.state.lock:
            variables = self.server.state['variables']

            for section_name, section_variables in sorted(variables.items()):
                tbody = TBody()

                self.html.extend([
                    H2(section_name),
                    Table(
                        THead(
                            Tr(
                                Th('Name'),
                                Th('Value'),
                            ),
                        ),
                        tbody,
                        _class='table table-striped',
                    ),
                ])

                for name, value in sorted(section_variables.items()):
                    tbody.append(
                        Tr(
                            Td(name),
                            Td(
                                self.generate_variable_input(
                                    section=section_name,
                                    name=name,
                                    value=value,
                                ),
                            ),
                        ),
                    )

        return self.html
