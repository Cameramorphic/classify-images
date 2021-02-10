import os

import pytest

@pytest.fixture(scope="module")
def docker_compose_file(pytestconfig):
    return os.path.join(str(pytestconfig.rootdir), "docker-compose.yml")

