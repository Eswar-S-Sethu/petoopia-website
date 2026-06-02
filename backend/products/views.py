from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer, ProductListSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow anyone to read; only staff can write."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer

    def get_queryset(self):
        qs = Product.objects.all()   # Router directs to products_db automatically

        category = self.request.query_params.get('category')
        is_best_seller = self.request.query_params.get('is_best_seller')
        is_new_arrival = self.request.query_params.get('is_new_arrival')
        search = self.request.query_params.get('search')
        in_stock = self.request.query_params.get('in_stock')

        if category:
            qs = qs.filter(category=category)
        if is_best_seller in ('true', '1'):
            qs = qs.filter(is_best_seller=True)
        if is_new_arrival in ('true', '1'):
            qs = qs.filter(is_new_arrival=True)
        if in_stock in ('true', '1'):
            qs = qs.filter(in_stock=True)
        if search:
            qs = qs.filter(name__icontains=search)

        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
