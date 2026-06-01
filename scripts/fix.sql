INSERT INTO "user_roles" ("userId", "roleId") SELECT id, 1 FROM "user" WHERE email='admin@jcuescore.com' ON CONFLICT DO NOTHING;
