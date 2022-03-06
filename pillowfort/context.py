from runpy import run_path
import inspect
import os

from lona_bootstrap_5 import TEMPLATE_DIR, MenuItem

from pillowfort.middlewares import (
    ActivitiesMiddleware,
    VariableMiddleware,
    DataMiddleware,
)

from pillowfort.views.activities_list import ActivitiesListView
from pillowfort.views.activities_show import ActivitiesShowView
from pillowfort.views.endpoints import EndpointsView
from pillowfort.views.variables import VariablesView
from pillowfort.views.data_edit import DataEditView
from pillowfort.views.data_list import DataListView
from pillowfort.endpoints import BlackHoleEndpoint
from pillowfort.endpoint import Endpoint


class Context:
    def __init__(self, lona_app):
        self.lona_app = lona_app

        # settings
        settings = self.lona_app.settings

        if os.path.exists(settings.PILLOWFORT_SETTINGS):
            settings.add(settings.PILLOWFORT_SETTINGS)

        settings.TEMPLATE_DIRS = [
            TEMPLATE_DIR,
        ]

        settings.FRONTEND_TEMPLATE = 'bootstrap_5/sidebar_left.html'
        settings.BOOTSTRAP_5_TITLE = settings.get('PROJECT_NAME', 'Pillowfort')

        # setup internal views
        self.lona_app.route(
            '/',
            name='pillowfort__endpoints',
        )(EndpointsView)

        self.lona_app.route(
            '/pillowfort/activities(/)',
            name='pillowfort__activities_list',
        )(ActivitiesListView)

        self.lona_app.route(
            '/pillowfort/activities/<id>',
            name='pillowfort__activities_show',
        )(ActivitiesShowView)

        self.lona_app.route(
            '/pillowfort/variables(/)',
            name='pillowfort__variables',
        )(VariablesView)

        self.lona_app.route(
            '/pillowfort/data/<model_name>(/)',
            name='pillowfort__data_list',
        )(DataListView)

        self.lona_app.route(
            '/pillowfort/data/<model_name>/<id>',
            name='pillowfort__data_edit',
        )(DataEditView)

        # setup menu
        self.lona_app.settings.BOOTSTRAP_5_MENU = [
            MenuItem(
                title='Endpoints',
                url='/',
                icon='card-list',
            ),
            MenuItem(
                title='Variables',
                url='/pillowfort/variables/',
                icon='gear',
            ),
            MenuItem(
                title='Activities',
                url='/pillowfort/activities/',
                icon='activity',
            ),
            MenuItem(divider=True),
        ]

        # setup middlewares
        self.lona_app.middleware(DataMiddleware)
        self.lona_app.middleware(ActivitiesMiddleware)
        self.lona_app.middleware(VariableMiddleware)

        # load endpoints
        end_point_root = self.lona_app.settings.END_POINT_ROOT

        for path in sorted(os.listdir(end_point_root)):
            name, ext = os.path.splitext(path)

            if ext != '.py':
                continue

            full_path = os.path.join(end_point_root, path)

            path_globals = run_path(
                path_name=full_path,
                run_name=full_path,
            )

            # find endpoints
            for name, attribute in path_globals.items():
                if(not inspect.isclass(attribute) or
                   not issubclass(attribute, Endpoint)
                   or attribute is Endpoint):

                   continue

                # register route
                self.lona_app.route(
                    attribute.URL,
                    name=attribute.ROUTE_NAME,
                    interactive=attribute.INTERACTIVE,
                )(attribute)

        # setup black hole endpoint
        self.lona_app.route(
            BlackHoleEndpoint.URL,
            name=BlackHoleEndpoint.NAME,
            interactive=BlackHoleEndpoint.INTERACTIVE,
        )(BlackHoleEndpoint)
