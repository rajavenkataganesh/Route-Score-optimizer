import importlib.util
import os
import sys

# Load genuine 'py' package from venv site-packages
_py_pkg_dir = os.path.join(os.path.dirname(__file__), "venv", "Lib", "site-packages", "py")
_init_py = os.path.join(_py_pkg_dir, "__init__.py")

if os.path.exists(_init_py):
    spec = importlib.util.spec_from_file_location("py", _init_py, submodule_search_locations=[_py_pkg_dir])
    _mod = importlib.util.module_from_spec(spec)
    sys.modules["py"] = _mod
    spec.loader.exec_module(_mod)
    # Forward all attributes
    globals().update(_mod.__dict__)
else:
    class DummyLocal:
        def __init__(self, path=""):
            self.path = path
    class DummyPath:
        local = DummyLocal
    path = DummyPath()
