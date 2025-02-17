from rest_framework import serializers
from .models import MpesaRequest, MpesaResponse

class MpesaRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MpesaRequest
        fields = ['phone_number', 'amount', 'account_reference', 'transaction_desc']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['amount'] = str(instance.amount)  # Convert Decimal to string
        return ret

    def validate(self, data):
        if not data.get('phone_number'):
            raise serializers.ValidationError("Phone number is required.")
        if not data.get('amount'):
            raise serializers.ValidationError("Amount is required.")
        if not data.get('account_reference'):
            raise serializers.ValidationError("Account reference is required.")
        if not data.get('transaction_desc'):
            raise serializers.ValidationError("Transaction description is required.")
        return data

class MpesaResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = MpesaResponse
        fields = '__all__'
