check_env:
	if [ ! -f ".env" ]; then echo ".env file not found"; exit 1; fi
build:
	make check_env && docker-compose -f docker-compose.yml build $(c)
up:
	make check_env && docker-compose -f docker-compose.yml up -d $(c)
start:
	make check_env && docker-compose -f docker-compose.yml start $(c)
down:
	make check_env && docker-compose -f docker-compose.yml down $(c)
destroy:
	make check_env && docker-compose -f docker-compose.yml down -v $(c)
stop:
	make check_env && docker-compose -f docker-compose.yml stop $(c)
restart:
	make check_env && docker-compose -f docker-compose.yml stop $(c)
	make check_env && docker-compose -f docker-compose.yml up -d $(c)
logs:
	make check_env && docker-compose -f docker-compose.yml logs --tail=100 -f $(c)
logs-app:
	make check_env && docker-compose -f docker-compose.yml logs --tail=100 -f app
ps:
	make check_env && docker-compose -f docker-compose.yml ps
login-app:
	make check_env && docker-compose -f docker-compose.yml exec app /bin/bash
login-frontend:
	make check_env && docker-compose -f docker-compose.yml exec frontend /bin/bash
login-db:
	make check_env && docker-compose -f docker-compose.yml exec mysql /bin/bash
db-shell:
	make check_env && docker-compose -f docker-compose.yml exec mysql mysql -uuser -ppassword