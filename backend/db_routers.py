class ProductsRouter:
    """
    Routes all database operations for the 'products' app to 'products_db'.
    Everything else goes to 'default' (users, auth, sessions, admin, etc.).
    """

    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'products':
            return 'products_db'
        return 'default'

    def db_for_write(self, model, **hints):
        if model._meta.app_label == 'products':
            return 'products_db'
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        # Allow relations within the same database group
        db_set = {'products_db'}
        if obj1._meta.app_label == 'products' and obj2._meta.app_label == 'products':
            return True
        if obj1._meta.app_label != 'products' and obj2._meta.app_label != 'products':
            return True
        return False

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label == 'products':
            return db == 'products_db'
        return db == 'default'
