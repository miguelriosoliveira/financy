export interface DbClient {
	connect(): Promise<void>;
	disconnect(): Promise<void>;
}
