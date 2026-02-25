import { RegisterClickData } from './clicks.queue';

export abstract class ClicksQueueService {
	abstract add(data: RegisterClickData): Promise<void>;
	abstract getBatch(count: number): Promise<RegisterClickData[]>;
}
