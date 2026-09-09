import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Pooja = {
    name: string;
    category: string;
    description: string | null;
    benefits: string | null;
    vidhi: string | null;
    samagri: string[] | null;
    duration_minutes: number;
    price: string;
    is_online: boolean;
    is_active: boolean;
};

type Errors = Partial<Record<string, string>>;

export function PoojaFormFields({
    pooja,
    errors,
}: {
    pooja?: Pooja;
    errors: Errors;
}) {
    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    name="name"
                    defaultValue={pooja?.name}
                    required
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <select
                    id="category"
                    name="category"
                    defaultValue={pooja?.category ?? 'daily'}
                    className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="special_occasion">Special occasion</option>
                </select>
                <InputError message={errors.category} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    rows={2}
                    defaultValue={pooja?.description ?? ''}
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="benefits">Benefits</Label>
                <Textarea
                    id="benefits"
                    name="benefits"
                    rows={2}
                    defaultValue={pooja?.benefits ?? ''}
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="vidhi">Vidhi (procedure)</Label>
                <Textarea
                    id="vidhi"
                    name="vidhi"
                    rows={4}
                    defaultValue={pooja?.vidhi ?? ''}
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="samagri_csv">
                    Samagri (comma-separated ingredients)
                </Label>
                <Input
                    id="samagri_csv"
                    name="samagri_csv"
                    defaultValue={pooja?.samagri?.join(', ') ?? ''}
                    placeholder="Flowers, Incense sticks, Ghee lamp"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                    <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                    <Input
                        id="duration_minutes"
                        name="duration_minutes"
                        type="number"
                        min={15}
                        max={600}
                        defaultValue={pooja?.duration_minutes ?? 60}
                        required
                    />
                    <InputError message={errors.duration_minutes} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                        id="price"
                        name="price"
                        type="number"
                        min={0}
                        step="0.01"
                        defaultValue={pooja?.price}
                        required
                    />
                    <InputError message={errors.price} />
                </div>
            </div>

            <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                    <input type="hidden" name="is_online" value="0" />
                    <input
                        type="checkbox"
                        name="is_online"
                        value="1"
                        defaultChecked={pooja?.is_online ?? true}
                        className="accent-primary size-4"
                    />
                    Available online
                </label>
                <label className="flex items-center gap-2 text-sm">
                    <input type="hidden" name="is_active" value="0" />
                    <input
                        type="checkbox"
                        name="is_active"
                        value="1"
                        defaultChecked={pooja?.is_active ?? true}
                        className="accent-primary size-4"
                    />
                    Active (visible to customers)
                </label>
            </div>
        </>
    );
}
