import logging
import os

from lona_bootstrap_5 import MenuItem
from flamingo import Content, ContentSet
import yaml

from pillowfort import Endpoint, Variable


class ModelManager:
    def get_model(self, name):
        if not hasattr(self, name):
            setattr(self, name, ContentSet())

        return getattr(self, name)


class DataMiddleware:
    async def on_startup(self, data):
        server = data.server
        model_manager = ModelManager()
        logger = logging.getLogger('pillowfort.data')

        for path in os.listdir(server.settings.DATA_ROOT):
            current_id = 0
            name, ext = os.path.splitext(path)

            if ext not in ('.yml', '.yaml'):
                continue

            full_path = os.path.join(
                server.settings.DATA_ROOT,
                path,
            )

            logger.debug('reading %s', full_path)

            try:
                with open(full_path, 'r') as stream:
                    data = yaml.safe_load(stream)

                    for model_name, model_objects in data.items():
                        model = model_manager.get_model(model_name)

                        for model_object in model_objects:

                            # auto id
                            if 'id' not in model_object:
                                model_object['id'] = current_id
                                current_id += 1

                            model.add(**model_object)

            except Exception:
                logger.exception(
                    'exception raised while reading %s',
                    full_path,
                )

        server.state['models'] = model_manager

        # populate navigation #################################################
        model_names = []

        for attribute_name in dir(model_manager):
            attribute = getattr(model_manager, attribute_name)

            if not isinstance(attribute, ContentSet):
                continue

            model_names.append(attribute_name)

        model_names.sort()

        for model_name in model_names:
            server.settings.BOOTSTRAP_5_MENU.append(
                MenuItem(
                    title=model_name,
                    route_name='pillowfort__data_list',
                    route_args={
                        'model_name': model_name,
                    }
                ),
            )


class ActivitiesMiddleware:
    async def on_startup(self, data):
        server = data.server

        server.state['activities'] = []


class VariableMiddleware:
    async def on_startup(self, data):
        server = data.server
        model_manager = ModelManager()

        server.state['variables'] = {}
        variables = server.state['variables']

        for route in server._router.routes:
            view = route.view

            if not issubclass(view, Endpoint):
                continue

            for variable in view.VARIABLES:
                if variable.section not in variables:
                    variables[variable.section] = {}

                variables[variable.section][variable.name] = variable.value