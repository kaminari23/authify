import { ErrorService } from '../services/error.service';

export function CatchError(context?: string) {
    return function (
        target: Object,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<any>
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const errorService = this.errorService as ErrorService;

            try {
                return await originalMethod.apply(this, args);
            } catch (error) {
                if (errorService) {
                    return await errorService.handle(error, context || propertyKey.toString());
                }
            }
        };

        return descriptor;
    };
}