import { Angular4ExpressFirebasePage } from './app.po';

describe('angular4-express-firebase App', () => {
  let page: Angular4ExpressFirebasePage;

  beforeEach(() => {
    page = new Angular4ExpressFirebasePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
