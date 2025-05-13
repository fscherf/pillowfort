from django.urls import include, path
from django.contrib import admin

from pillowfort.views import game, gui

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('django.contrib.auth.urls')),
    path('gui', gui.index),
    path('', game.index),
]
