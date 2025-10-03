import mongoose, { Document } from 'mongoose';

// Subdocument schema for Cloudinary images
const CloudinaryImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  public_id: {
    type: String,
    required: true
  }
}, { _id: false });

// Subdocument schema for time slots
const TimeSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format validation
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format validation
  }
}, { _id: false });

// Interface for User document
interface IUser extends Document {
  uid: string;
  name: string;
  email: string;
  role: 'customer' | 'owner';
  phone?: string;
  businessName?: string;
  emailVerified: boolean;
  isActive: boolean;
  upiQrCode?: {
    url: string;
    public_id: string;
  };
  turfImages?: Array<{
    url: string;
    public_id: string;
  }>;
  sportsOffered?: string[];
  customSport?: string;
  amenities?: string[];
  about?: string;
  availableSlots?: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
  pricing?: number;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
  };
}

const UserSchema = new mongoose.Schema({
  uid: { 
    type: String, 
    required: true, 
    unique: true
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true 
  },
  role: { 
    type: String, 
    enum: ['customer', 'owner'], 
    required: true 
  },
  phone: String,
  businessName: String, // Only for owners
  emailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Owner-specific fields (only required when role is 'owner')
  upiQrCode: {
    type: CloudinaryImageSchema,
    required: function(this: IUser): boolean {
      return this.role === 'owner';
    }
  },
  
  turfImages: {
    type: [CloudinaryImageSchema],
    validate: {
      validator: function(this: IUser, images: any[]): boolean {
        if (this.role === 'owner') {
          return images && images.length > 0;
        }
        return true;
      },
      message: 'At least one turf image is required for owners'
    }
  },
  
  sportsOffered: {
    type: [String],
    enum: ['Football', 'Cricket', 'Badminton', 'Tennis', 'Basketball', 'Other'],
    validate: {
      validator: function(this: IUser, sports: string[]): boolean {
        if (this.role === 'owner') {
          return sports && sports.length > 0;
        }
        return true;
      },
      message: 'At least one sport must be selected for owners'
    }
  },
  
  customSport: {
    type: String,
    required: function(this: IUser): boolean {
      return this.role === 'owner' && Boolean(this.sportsOffered && this.sportsOffered.includes('Other'));
    }
  },
  
  amenities: {
    type: [String],
    enum: ['Floodlights', 'Parking', 'Washroom', 'Equipment'],
    default: []
  },
  
  about: {
    type: String,
    maxlength: 1000,
    required: function(this: IUser): boolean {
      return this.role === 'owner';
    }
  },
  
  availableSlots: {
    type: [TimeSlotSchema],
    validate: {
      validator: function(this: IUser, slots: any[]): boolean {
        if (this.role === 'owner') {
          return slots && slots.length > 0;
        }
        return true;
      },
      message: 'At least one time slot is required for owners'
    }
  },
  
  // Additional owner fields for business management
  pricing: {
    type: Number,
    min: 0,
    required: function(this: IUser): boolean {
      return this.role === 'owner';
    }
  },
  
  location: {
    address: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Create indexes for faster queries
UserSchema.index({ role: 1 });
UserSchema.index({ 'location.city': 1 });
UserSchema.index({ sportsOffered: 1 });

// Pre-save middleware to validate owner-specific fields
UserSchema.pre('save', function(this: IUser, next) {
  if (this.role === 'owner') {
    // Ensure required owner fields are present
    if (!this.upiQrCode || !this.turfImages || this.turfImages.length === 0) {
      return next(new Error('UPI QR code and turf images are required for owners'));
    }
    
    if (!this.sportsOffered || this.sportsOffered.length === 0) {
      return next(new Error('At least one sport must be selected for owners'));
    }
    
    if (this.sportsOffered.includes('Other') && !this.customSport) {
      return next(new Error('Custom sport name is required when "Other" is selected'));
    }
    
    if (!this.about || this.about.trim().length === 0) {
      return next(new Error('About section is required for owners'));
    }
    
    if (!this.availableSlots || this.availableSlots.length === 0) {
      return next(new Error('At least one time slot is required for owners'));
    }
    
    if (!this.pricing || this.pricing <= 0) {
      return next(new Error('Valid pricing is required for owners'));
    }
  }
  
  next();
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
