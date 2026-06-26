import { CategoryDistributionCard } from './CategoryDistributionCard';
import { MonthlySalesTrendCard } from './MonthlySalesTrendCard';
import { TopSongsCard } from './TopSongsCard';

function Stats() {
	return (
		<div className='space-y-6'>
			<div className='grid lg:grid-cols-3 gap-6 min-w-0'>
				<CategoryDistributionCard />
				<TopSongsCard />
			</div>
			<MonthlySalesTrendCard />
		</div>
	);
}

export default Stats;
