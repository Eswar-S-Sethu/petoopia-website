from django.urls import path
from .views import (
    RegisterView, LoginView, TokenRefreshView,
    ProfileView, ChangePasswordView,
    PetsView, PetItemView,
    CartView, CartItemView,
    WishlistView, WishlistItemView,
    AdminStatsView, AdminUsersView, AdminUserDetailView,
)

urlpatterns = [
    # Auth
    path('register/',           RegisterView.as_view()),
    path('login/',              LoginView.as_view()),
    path('token/refresh/',      TokenRefreshView.as_view()),

    # Profile
    path('profile/',            ProfileView.as_view()),
    path('change-password/',    ChangePasswordView.as_view()),

    # Pets
    path('pets/',               PetsView.as_view()),
    path('pets/<int:pk>/',      PetItemView.as_view()),

    # Cart
    path('cart/',               CartView.as_view()),
    path('cart/<int:pk>/',      CartItemView.as_view()),

    # Wishlist
    path('wishlist/',           WishlistView.as_view()),
    path('wishlist/<int:pk>/',  WishlistItemView.as_view()),

    # Admin
    path('admin/stats/',              AdminStatsView.as_view()),
    path('admin/users/',              AdminUsersView.as_view()),
    path('admin/users/<int:pk>/',     AdminUserDetailView.as_view()),
]
