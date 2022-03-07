#!/usr/bin/env python
# -*- coding: utf-8 -*-

from setuptools import find_packages, setup

from pillowfort import VERSION_STRING

setup(
    include_package_data=True,
    name='pillowfort',
    version=VERSION_STRING,
    author='Florian Scherf',
    url='https://github.com/fscherf/pillowfort',
    author_email='mail@florianscherf.de',
    license='MIT',
    packages=find_packages(),
    install_requires=[
        'lona',
        'lona-bootstrap-5==0.3',
        'pyyaml',
        'flamingo==1.7.1',
    ],
    scripts=[
        'bin/pillowfort',
    ],
)
