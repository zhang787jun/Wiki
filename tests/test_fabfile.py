import contextlib
import pathlib
import sys
import types

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

fabric_module = types.ModuleType("fabric")
fabric_api = types.ModuleType("fabric.api")
fabric_colors = types.ModuleType("fabric.colors")
fabric_contrib = types.ModuleType("fabric.contrib")
fabric_contrib_project = types.ModuleType("fabric.contrib.project")
simiki_module = types.ModuleType("simiki")
simiki_config = types.ModuleType("simiki.config")
simiki_compat = types.ModuleType("simiki.compat")


@contextlib.contextmanager
def _settings(*args, **kwargs):
    yield


def _task(func=None, *args, **kwargs):
    if func is None:
        return lambda inner: inner
    return func


def _local(*args, **kwargs):
    return None


fabric_api.env = types.SimpleNamespace()
fabric_api.local = _local
fabric_api.task = _task
fabric_api.settings = _settings
fabric_colors.blue = lambda message: message
fabric_colors.red = lambda message: message
fabric_contrib_project.rsync_project = lambda *args, **kwargs: None
simiki_config.parse_config = lambda *args, **kwargs: {}
simiki_compat.raw_input = lambda *args, **kwargs: ""

sys.modules["fabric"] = fabric_module
sys.modules["fabric.api"] = fabric_api
sys.modules["fabric.colors"] = fabric_colors
sys.modules["fabric.contrib"] = fabric_contrib
sys.modules["fabric.contrib.project"] = fabric_contrib_project
sys.modules["simiki"] = simiki_module
sys.modules["simiki.config"] = simiki_config
sys.modules["simiki.compat"] = simiki_compat

import fabfile


def test_get_rsync_configs_returns_rsync_entry(monkeypatch):
    sample_configs = {
        "deploy": [
            {"type": "ftp", "host": "ftp.example.com"},
            {"type": "rsync", "host": "rsync.example.com"},
            {"type": "git", "remote": "origin"},
        ]
    }

    monkeypatch.setattr(fabfile, "configs", sample_configs)

    assert fabfile.get_rsync_configs() == {
        "type": "rsync",
        "host": "rsync.example.com",
    }


def test_deploy_does_not_mutate_config(monkeypatch):
    sample_configs = {"deploy": [{"type": "git", "remote": "origin"}]}
    received_config = {}

    monkeypatch.setattr(fabfile, "configs", sample_configs)
    monkeypatch.setattr(
        fabfile, "deploy_git", lambda deploy_config: received_config.update(deploy_config)
    )

    fabfile.deploy()

    assert sample_configs["deploy"][0]["type"] == "git"
    assert received_config == {"type": "git", "remote": "origin"}
