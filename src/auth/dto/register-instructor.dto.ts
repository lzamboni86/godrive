export class RegisterInstructorDto {
  name: string;
  email: string;
  phone: string;
  cnh: string;
  vehicleModel: string;
  vehicleMake?: string;
  vehicleYear?: number;
  transmission?: 'MANUAL' | 'AUTOMATIC';
  engineType?: 'COMBUSTION' | 'ELECTRIC';
  vehiclePlate: string;
  state?: string;
  city?: string;
  neighborhoodReside?: string;
  neighborhoodTeach?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  hourlyRate: number;
  password: string;
}
