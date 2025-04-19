from django import template

register = template.Library()


@register.simple_tag()
def frontend_static(rel_path):
    if rel_path.startswith('/'):
        rel_path = rel_path[1:]

    return f'/static/frontend/{rel_path}'
