import { CategoryDistributionCard } from './CategoryDistributionCard';
import { TopSongsCard } from './TopSongsCard';
import { MonthlySalesTrendCard } from './MonthlySalesTrendCard';

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
