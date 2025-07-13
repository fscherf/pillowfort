import pytest


def test_space_names(transactional_db):
    from django.core.exceptions import ValidationError

    from pillowfort.models import Space

    # create root space
    root_space = Space.objects.create(
        name="",
        verbose_name="root",
    )

    Space.objects.create(
        parent=root_space,
        name="users",
        verbose_name="Users",
    )

    # the root space needs to be unique
    with pytest.raises(ValidationError):
        Space.objects.create(
            name="",
            verbose_name="root2",
        )

    # only the root space can have an empty name
    with pytest.raises(ValidationError):
        Space.objects.create(
            parent=root_space,
            name="",
            verbose_name="root2",
        )

    # parent and name combinations need to be unique
    with pytest.raises(ValidationError):
        Space.objects.create(
            parent=root_space,
            name="users",
            verbose_name="Users",
        )

    # all named spaces need a parent space
    with pytest.raises(ValidationError):
        Space.objects.create(
            name="root",
            verbose_name="root2",
        )


def test_space_urls(transactional_db):
    from pillowfort.models import Space

    space_1, _ = Space.objects.get_or_create_by_url("/foo")
    space_2, _ = Space.objects.get_or_create_by_url("/foo/bar/baz")
    space_3, _ = Space.objects.get_or_create_by_url("/foo/bar/foobar/")
    space_4, _ = Space.objects.get_or_create_by_url("/bar")

    space_1_modified = space_1.modified
    space_2_modified = space_2.modified
    space_3_modified = space_3.modified
    space_4_modified = space_4.modified

    assert space_1.url == "/foo"
    assert space_2.url == "/foo/bar/baz"
    assert space_3.url == "/foo/bar/foobar"
    assert space_4.url == "/bar"

    space_1.name = "foo2"
    space_1.save()

    space_1.refresh_from_db()
    space_2.refresh_from_db()
    space_3.refresh_from_db()
    space_4.refresh_from_db()

    assert space_1.url == "/foo2"
    assert space_2.url == "/foo2/bar/baz"
    assert space_3.url == "/foo2/bar/foobar"
    assert space_4.url == "/bar"

    assert space_1.modified != space_1_modified
    assert space_2.modified != space_2_modified
    assert space_3.modified != space_3_modified
    assert space_4.modified == space_4_modified


def test_space_access(transactional_db):
    from pillowfort.models import AccessRule, Account, Space

    # setup accounts
    admin, _ = Account.objects.get_or_create_by_username("admin")
    user_1, _ = Account.objects.get_or_create_by_username("user-1")
    user_2, _ = Account.objects.get_or_create_by_username("user-2")

    # setup spaces
    root_space, _ = Space.objects.get_or_create_by_url("/")

    user_spaces, _ = Space.objects.get_or_create_by_url("/u")
    user_1_space, _ = Space.objects.get_or_create_by_url("/u/user-1")

    org_space, _ = Space.objects.get_or_create_by_url("/o")
    org_user_1_space, _ = Space.objects.get_or_create_by_url("/o/user-1")

    public_space, _ = Space.objects.get_or_create_by_url("/p")
    public_user_1_space, _ = Space.objects.get_or_create_by_url("/p/user-1")

    public_space.is_public = True
    public_space.save()

    # setup access rules
    # admin
    AccessRule.objects.create(
        account=admin,
        space=root_space,
        is_admin=True,
    )

    # user space
    AccessRule.objects.create(
        account=user_1,
        space=user_1_space,
        is_admin=True,
    )

    # org
    AccessRule.objects.create(
        account=user_1,
        space=org_space,
        can_edit=True,
    )

    AccessRule.objects.create(
        space=org_user_1_space,
        account=user_1,
        is_admin=True,
    )

    # public
    AccessRule.objects.create(
        account=user_1,
        space=public_user_1_space,
        is_admin=True,
    )

    # run checks
    # /: only admin should have access to this space
    space = Space.objects.get_by_url("/")
    admin_access = space.get_access(admin)
    user_1_access = space.get_access(user_1)
    user_2_access = space.get_access(user_2)

    assert admin_access.has_access
    assert admin_access.is_admin

    assert not user_1_access.has_access
    assert not user_1_access.is_admin

    assert not user_2_access.has_access
    assert not user_2_access.is_admin

    # /u: only admin should have access to this space
    space = Space.objects.get_by_url("/u")
    admin_access = space.get_access(admin)
    user_1_access = space.get_access(user_1)
    user_2_access = space.get_access(user_2)

    assert admin_access.has_access
    assert admin_access.is_admin

    assert not user_1_access.has_access
    assert not user_1_access.is_admin

    assert not user_2_access.has_access
    assert not user_2_access.is_admin

    # /u/user-1: admin should have admin access
    #            user-1 should have admin access
    #            user-2 should have no access
    space = Space.objects.get_by_url("/u/user-1")
    admin_access = space.get_access(admin)
    user_1_access = space.get_access(user_1)
    user_2_access = space.get_access(user_2)

    assert admin_access.has_access
    assert admin_access.is_admin

    assert user_1_access.has_access
    assert user_1_access.is_admin

    assert not user_2_access.has_access
    assert not user_2_access.is_admin

    # /o: admin should have admin access
    #     user-1 should have edit access
    #     user-2 should have no access

    space = Space.objects.get_by_url("/o")
    admin_access = space.get_access(admin)
    user_1_access = space.get_access(user_1)
    user_2_access = space.get_access(user_2)

    assert admin_access.has_access
    assert admin_access.is_admin

    assert user_1_access.has_access
    assert user_1_access.can_edit
    assert not user_1_access.is_admin

    assert not user_2_access.has_access
    assert not user_2_access.can_edit
    assert not user_2_access.is_admin

    # /o/user-1: admin should have admin access
    #            user-1 should have edit access
    #            user-2 should have no access

    space = Space.objects.get_by_url("/o/user-1")
    admin_access = space.get_access(admin)
    user_1_access = space.get_access(user_1)
    user_2_access = space.get_access(user_2)

    assert admin_access.has_access
    assert admin_access.is_admin

    assert user_1_access.has_access
    assert user_1_access.is_admin

    assert not user_2_access.has_access
    assert not user_2_access.can_edit
    assert not user_2_access.is_admin

    # /p: admin should have admin access
    #     user-1 should have basic access
    #     user-2 should have basic access

    space = Space.objects.get_by_url("/p")
    admin_access = space.get_access(admin)
    user_1_access = space.get_access(user_1)
    user_2_access = space.get_access(user_2)

    assert admin_access.has_access
    assert admin_access.is_admin

    assert user_1_access.has_access
    assert not user_1_access.is_admin

    assert user_2_access.has_access
    assert not user_2_access.is_admin

    # /p/user-1: admin should have admin access
    #            user-1 should admin access
    #            user-2 should basic access

    space = Space.objects.get_by_url("/p/user-1")
    admin_access = space.get_access(admin)
    user_1_access = space.get_access(user_1)
    user_2_access = space.get_access(user_2)

    assert admin_access.has_access
    assert admin_access.is_admin

    assert user_1_access.has_access
    assert user_1_access.is_admin

    assert user_2_access.has_access
    assert not user_2_access.is_admin


def test_asset_and_tileset_access(transactional_db):
    from pillowfort.models import Tileset, Asset, Space

    def get_asset_names(space):
        names = []

        for asset in space.assets_all:
            names.append(asset.name)

        return sorted(names)

    def get_tileset_names(space):
        names = []

        for tileset in space.tilesets_all:
            names.append(tileset.name)

        return sorted(names)

    space_1, _ = Space.objects.get_or_create_by_url("/1")
    space_2, _ = Space.objects.get_or_create_by_url("/1/2")
    space_3, _ = Space.objects.get_or_create_by_url("/1/2/3")

    asset_1 = Asset.objects.create(
        name="asset_1",
        space=space_1,
    )

    asset_2 = Asset.objects.create(
        name="asset_2",
        space=space_2,
    )

    asset_3 = Asset.objects.create(
        name="asset_3",
        space=space_3,
    )

    Tileset.objects.create(
        name="tileset_1",
        space=space_1,
        asset=asset_1,
        width=32,
        height=32,
    )

    Tileset.objects.create(
        name="tileset_2",
        space=space_2,
        asset=asset_2,
        width=32,
        height=32,
    )

    Tileset.objects.create(
        name="tileset_3",
        space=space_3,
        asset=asset_3,
        width=32,
        height=32,
    )

    # run checks
    # assets
    assert get_asset_names(space_1) == ["asset_1"]
    assert get_asset_names(space_2) == ["asset_1", "asset_2"]
    assert get_asset_names(space_3) == ["asset_1", "asset_2", "asset_3"]

    # tilesets
    assert get_tileset_names(space_1) == ["tileset_1"]
    assert get_tileset_names(space_2) == ["tileset_1", "tileset_2"]
    assert get_tileset_names(space_3) == ["tileset_1", "tileset_2", "tileset_3"]
