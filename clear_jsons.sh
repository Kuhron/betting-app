find -name orders.json | xargs -d "\n" rm
find -name trades.json | xargs -d "\n" rm
rm users.json
rm securityData/securities.json
