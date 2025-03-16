
export interface ServiceRequest {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  watch_brand: string;
  watch_model: string | null;
  serial_number: string | null;
  service_type: string;
  description: string | null;
  status: string;
  estimated_completion: string | null;
  price: number | null;
  created_at: string;
  updated_at: string | null;
  payment_status: string | null;
  payment_method: string | null;
}

export const serviceStatusStyles = {
  pending: { 
    color: "text-amber-700 bg-amber-100", 
    icon: "Clock" 
  },
  "in progress": { 
    color: "text-blue-700 bg-blue-100", 
    icon: "AlertTriangle" 
  },
  "ready for pickup": { 
    color: "text-purple-700 bg-purple-100", 
    icon: "CheckCircle" 
  },
  completed: { 
    color: "text-green-700 bg-green-100", 
    icon: "CheckCircle" 
  },
  cancelled: { 
    color: "text-red-700 bg-red-100", 
    icon: "XCircle" 
  }
};

export const paymentStatusStyles = {
  unpaid: {
    color: "text-red-700 bg-red-100",
    icon: "AlertCircle"
  },
  partially_paid: {
    color: "text-amber-700 bg-amber-100",
    icon: "CircleDollarSign"
  },
  paid: {
    color: "text-green-700 bg-green-100",
    icon: "CheckCircle"
  }
};
