# Data Structures


## Blueprint / Data
```python
{
    // meta data
    "tileWidth": 32,
    "tileHeight": 32,
    "width": 1
    "height": 2,

    // animations
    "animations": {
        "idleSouth": {
            "frames": [

                // tile frame
                {
                    "duration": 100,          // duration in ms
                    "layers": [
                        {
                            "type": "tiles",
                            "data": [
                                0,            // blueprint tile id
                                "<UUID>",     // tileset UUID
                                0,            // tileset tile id
                            ],
                        },
                    ],
                },

                // image frame
                {
                    "duration": 100,          // duration in ms
                    "layers": [
                        {
                            "type": "image",
                            "data": [
                                0,            // blueprint tile id
                                "<UUID>",     // asset UUID
                            ],
                        },
                    ],
                },
            ],
        },
    },
}
```


# Space / Map Data

```python
{
    // meta data
    "tileWidth": 32,
    "tileHeight": 32,
    "width": 10,
    "height": 8,
    "backgroundColor": "#000000",

    // layers
    "layers": [

        // tile layer
        {
            "type": "tiles",
            "data": [
                [
                    0,             // map tile id
                    "<UUID>",      // tileset UUID
                    0,             // tileset tile id
                ],
            ],
        },

        // image layer
        {
            "type": "image",
            "data": [
                [
                    0,             // map tile id
                    "<UUID>",      // asset UUID
                ],
            ],
        },

        // blueprint layer
        {
            "type": "blueprint",
            "data": [
                [
                    0,             // map tile id
                    "<UUID>",      // blueprint UUID
                ],
            ],
        },
    ],

    // entities
    "entities": [
        {
            "id": "entity-1",
            "blueprint": "<UUID>",  // blueprint UUID
            "animation": "idleSouth",
            "x": 10,
            "y": 10,
        },
    ],
}
```

## RPC / Map Data

```python
{
    "assets": {
        "<UUID>": "<URL>",           // asset UUID, asset URL
    },
    "tilesets": {
        "<UUID>": {                  // tileset UUID
            "tileWidth": 32,
            "tileHeight": 32,
            "width": 10,
            "height": 8,
            "asset": "<UUID>",       // asset UUID
        },
    },
    "blueprints": {
        "<UUID>": <BLUEPRINT DATA>,  // blueprint UUID
    },
    "map_data": <MAP DATA>,
}
```
